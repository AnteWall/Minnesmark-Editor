import os
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from editor.models import Media, Route
from minnesmark.settings import PROJECT_ROOT


@login_required
def render_page(request):
    return render(request, 'editor/editor.html')

@login_required
def render_page_general(request):
    if request.method == 'POST':
        success = False
        if request.user.is_authenticated():
            username = request.user.username
            success = handle_upload(request.FILES['media_file'],username)

        if(success):
            print("Funka!")
        else:
            print("Fuck...")


    return render(request, 'editor/general.html')

@login_required
def render_page_media(request):
    return render(request, 'editor/media.html')

@login_required
def render_page_publish(request):
    return render(request, 'editor/publish.html')

@login_required
def render_page_addMedia(request):
    return render(request, 'editor/addMedia.html')

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
    return redirect('/editor/general/?id='+str(route.id))


