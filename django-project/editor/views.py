import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from editor.models import Routes,Markers,Points
from django.shortcuts import redirect


@login_required
def render_page(request):
    return render(request, 'editor/editor.html')


def save_route_to_database(request):
    response_data = {}

    #TODO FIX SAVE TO GET ID FROM EDITOR

    if request.user.is_authenticated():
        """Load JSON"""
        try:
            json_str = request.body.decode(encoding='UTF-8')
            json_obj = json.loads(json_str)
        except:
            response_data['result'] = 'failed'
            response_data['message'] = 'Kunde inte ladda data'


        try:
            for marker in json_obj["markers"]:
                marker = Markers(route=route,latitude=marker["latitude"],
                                 longitude=marker["longitude"],
                                 number=marker["number"],
                                 index=marker["index"])
                marker.save()
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

    return HttpResponse(json.dumps(response_data), content_type="application/json")


@login_required
def createRoute(request):
    route = Routes(user=request.user,name=request.POST["route_name"])
    route.save()
    return redirect('/editor/?id='+str(route.id))
