import json
import os
from django.http import HttpResponse
from django.shortcuts import render, redirect, render_to_response
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from editor import models
import editor
from editor.models import Media, Route, Station, Polyline
from minnesmark.settings import PROJECT_ROOT

# Login_required means that the user has to be looged in to see that specific page

def get_all_routes_from_user(user_id):
    routes = Route.objects.filter(user_id=user_id)
    return routes

@login_required
def render_page_no_route(request):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/norouteselected.html', {'routes': routes},
                              context_instance=RequestContext(request))

@login_required
def render_page(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/editor.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

@login_required
def render_page_general(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    route = Route.objects.get(id=route_id)
    route_name = route.name
    if request.method == 'POST':
        success = False
        if request.user.is_authenticated():
            username = request.user.username
            success = handle_upload(request.FILES['media_file'],username)

        if(success):
            print("Funka!")
        else:
            print("Fuck...")
    return render_to_response('editor/general.html', {'routes': routes,'cur_route':route_id,'cur_route_name':route_name},
                              context_instance=RequestContext(request))

@login_required
def render_page_media(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    cur_route = Route.objects.get(id=route_id)
    if cur_route.user == request.user or request.user.is_superuser:
        stations = Station.objects.filter(route=cur_route)
        return render_to_response('editor/media.html',
                                  {'routes': routes,
                                   'cur_route':route_id,
                                   'stations':stations},
                              context_instance=RequestContext(request))
    else:
        redirect('/account/login')


@login_required
def render_page_publish(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/publish.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

@login_required
def render_page_addMedia(request):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/addMedia.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

def handle_upload(f,username):
    folder = os.path.join(PROJECT_ROOT, '../users/'+username+'/')
    try:
        os.mkdir(folder)
    except:
        pass

    fname = f.name
    fullpath = folder+f.name
    with open(folder+f.name,'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    #Name, Filepath,Size,Treasure
    media = Media(name=fname,filepath=fullpath,size=f.size)
    media.save()
    return True

@login_required
def load_route_from_db(request,route_id):
    response_data = {}
    try:
        route = Route.objects.get(id = route_id,user=request.user)
    except Route.DoesNotExist:
        return HttpResponse(json.dumps("ERROR"), content_type="application/json")

    stations = Station.objects.filter(route=route)
    response_data["stations"] = []
    for s in stations:
        response_data["stations"].append(s.as_json())
    points = Polyline.objects.filter(route=route)
    response_data["points"] = []
    for p in points:
        response_data["points"].append(p.as_json())


    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required
def save_route_to_database(request):
    response_data = {}




    """Load JSON"""
    try:
        json_str = request.body.decode(encoding='UTF-8')
        json_obj = json.loads(json_str)
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte ladda data'
    try:
        route_id = json_obj["route_id"]
        route = Route.objects.get(id=route_id)
        r_station = Station.objects.filter(route = route).delete()
        r_polyline = Polyline.objects.filter(route = route).delete()
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte ladda rutt från id'
    try:

        for s in json_obj["stations"]:
            station = Station(route=route,
                             number=s["number"],
                             index=s["index"],
                             longitude=s["longitude"],
                             latitude=s["latitude"])
            station.save()
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte spara markörer'

    try:
        for point in json_obj["points"]:
            point = Polyline(route=route,
                           latitude=point["latitude"],
                           longitude=point["longitude"],
                           index=point["index"])
            point.save()
        response_data['result'] = 'ok'
        response_data['message'] = 'Rutten sparades'
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte spara punkter'


    return HttpResponse(json.dumps(response_data), content_type="application/json")
    #return HttpResponse("kunde ha sparat data, men neee")

@login_required
def create_route(request):
    route = Route(user=request.user)
    route.save()
    return redirect('/editor/general/'+str(route.id))


@login_required
def save_route_name_to_db(request):
    response_data = {}

    """Load JSON"""
    try:
        json_str = request.body.decode(encoding='UTF-8')
        json_obj = json.loads(json_str)
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte ladda rutt från id'

    route = Route.objects.get(id=json_obj["route_id"])
    if route.user == request.user:
        route.name = json_obj['name'];
        route.save()
        response_data['result'] = 'ok'
        response_data['message'] = 'Sparat'
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    else:
        response_data['result'] = 'failed'
        response_data['message'] = 'Du äger inte denna rutt.'
        return HttpResponse(json.dumps(response_data), content_type="application/json")


