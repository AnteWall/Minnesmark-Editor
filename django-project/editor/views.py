import os
from django.http import HttpResponse
from django.shortcuts import render, redirect, render_to_response
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from editor.models import Media, Route
from minnesmark.settings import PROJECT_ROOT


def get_all_routes_from_user(user_id):
    routes = Route.objects.filter(user_id=user_id)
    return routes

@login_required
def render_page(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/editor.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

@login_required
def render_page_general(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    if request.method == 'POST':
        success = False
        if request.user.is_authenticated():
            username = request.user.username
            success = handle_upload(request.FILES['media_file'],username)

        if(success):
            print("Funka!")
        else:
            print("Fuck...")
    return render_to_response('editor/general.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

@login_required
def render_page_media(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/media.html', {'routes': routes,'cur_route':route_id},                              context_instance=RequestContext(request))

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
def save_route_to_database(request):
    response_data = {}

    #TODO FIX SAVE TO GET ID FROM EDITOR

    '''if request.user.is_authenticated():
        """Load JSON"""
        try:
            json_str = request.body.decode(encoding='UTF-8')
            json_obj = json.loads(json_str)
        except:
            response_data['result'] = 'failed'
            response_data['message'] = 'Kunde inte ladda data'


        try:
            for station in json_obj["markers"]:
                station = Markers(route=route,latitude=station["latitude"],
                                 longitude=station["longitude"],
                                 number=station["number"],
                                 index=station["index"])
                station.save()
        except:
            response_data['result'] = 'failed'
            response_data['message'] = 'Kunde inte spara markörer'

        try:
            for point in json_obj["points"]:
                point = Points(route=route,
                               latitude=point["latitude"],
                               longitude=point["longitude"],
                               index=point["index"])
                point.save()
            response_data['result'] = 'ok'
            response_data['route_id'] = route.id
            response_data['message'] = 'Rutten sparades'
        except:
            response_data['result'] = 'failed'
            response_data['message'] = 'Kunde inte spara punkter'

    else:
        response_data['result'] = 'failed'
        response_data['message'] = 'Rutten sparades inte'

    return HttpResponse(json.dumps(response_data), content_type="application/json")'''
    return HttpResponse("kunde ha sparat data, men neee")

@login_required
def create_route(request):
    route = Route(user=request.user)
    route.save()
    return redirect('/editor/general/'+str(route.id))


