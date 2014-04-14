import json
import os
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import render, redirect, render_to_response
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from editor import models
import editor
from editor.models import Media, Route, Station, Polyline
from minnesmark.settings import PROJECT_ROOT

# Login_required means that the user has to be looged in to see that specific page

#Get all route that the owner has created
def get_all_routes_from_user(user_id):
    routes = Route.objects.filter(user_id=user_id)
    return routes

# /editor
# Displays when no route is selected
@login_required
def render_page_no_route(request):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/norouteselected.html', {'routes': routes},
                              context_instance=RequestContext(request))

# /edtior/station/<route_id>
# Render page with editor
@login_required
def render_page(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/editor.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

# /editor/general/<route_id>
# Renders general page with startmedia and route name
@login_required
def render_page_general(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    route = Route.objects.get(id=route_id)
    route_name = route.name
    #If POST request to page
    if request.method == 'POST':
        success = False
        media_id = -1
        if request.user.is_authenticated():

            try:
                #Runs if you want to delete a media in startmedia
                success = delete_media(request.POST['delmedia'], request.user.id)
            except:
                #otherwise you want to upload a media
                success, media_id = handle_upload(request.FILES['media_file'],
                                                  request.user.username,
                                                  request.user.id,route_id)
        #TODO some kind of validation
        if (success):
            pass
            #media_msg =
        else:
            print("Fuck...")

    #TODO save order of objects in list
    #Get all media set to startmedia
    start_media = []
    for m in Media.objects.filter(mediatype=Media.STARTMEDIA, user=request.user).order_by('order'):
        start_media.append(m.as_json())

    return render_to_response('editor/general.html', {'start_media':start_media,'routes': routes,'cur_route':route_id,'cur_route_name':route_name},
                              context_instance=RequestContext(request))

# /editor/media/<route_id>
# render All stations to be able to add media
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

# /editor/publish/<route_id>
# Renders publush page of route
@login_required
def render_page_publish(request,route_id):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/publish.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))
# /editor/media/<route_id>/station/<station_id>
# NOT DONT IN URL !!!!!
# TODO render right media with files
@login_required
def render_page_addMedia(request):
    routes = get_all_routes_from_user(request.user.id)
    return render_to_response('editor/addMedia.html', {'routes': routes,'cur_route':route_id},
                              context_instance=RequestContext(request))

# Function for uploading media
def handle_upload(f, username, user_id,route_id):
    #Set Project Path
    path = PROJECT_ROOT
    os.chdir(path)
    # Move up one
    os.chdir('..')
    #Enter user folder
    os.chdir('users/')
    folder = os.getcwd()

    try:
        #if User hasen't uploaded anything yet, create folder
        os.mkdir(username + '/')
    except:
        pass

    #change to user folder
    os.chdir(username)
    folder = os.getcwd()

    #Fullpath to file
    fullpath = folder + "/" + f.name

    #Try to create file
    try:
        with open(fullpath, 'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
    except:
        return False


    userobject = User.objects.get(id=user_id)
    route_object = Route.objects.get(id=route_id)
    media_count = Media.objects.filter(mediatype=Media.STARTMEDIA, user=userobject).count()
    #Save media as STARTMEDIA
    # TODO create any type of media and add to station
    media = Media(route=route_object,
                filename=f.name,
                filepath=fullpath,
                size=f.size,
                treasure=False,
                mediatype=Media.STARTMEDIA,
                user=userobject,
                order=media_count + 1,
                station=None)
    media.save()
    #If media has been saved return true
    if media.pk > 0:
        return True, media.pk
    else:
        return False




#Get all route info for loading to editor
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


#Save route from editor
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
    #Delete all old entrys and save over them
    try:
        route_id = json_obj["route_id"]
        route = Route.objects.get(id=route_id)
        r_station = Station.objects.filter(route = route).delete()
        r_polyline = Polyline.objects.filter(route = route).delete()
    except:
        response_data['result'] = 'failed'
        response_data['message'] = 'Kunde inte ladda rutt från id'
    #Save all stations
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
    #Save positoins on polyline
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

#Create a new Route for signed in user
@login_required
def create_route(request):
    route = Route(user=request.user)
    route.save()
    return redirect('/editor/general/'+str(route.id))

#Save the name for the route (using AJAX)
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

#Delete media that has been uploaded
# @param media_id ID of media
# @param user_id ID of user
def delete_media(media_id, user_id):
    m = Media.objects.get(id=media_id)
    u = User.objects.get(id=user_id)
    print(m.user)
    print(u)
    #Only delete if you uploaded or if you are admin
    if m.user.id == u.id or u.is_superuser:
        os.remove(m.filepath)
        m.delete()
        return True
    else:
        return False

