import json
import os
from django.contrib.auth.models import User
from django.shortcuts import render, render_to_response
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from editor.models import Media
from minnesmark.settings import PROJECT_ROOT


@login_required
def render_page(request):
    return render(request, 'editor/editor.html')



@login_required
def render_page_general(request):
    msg = None
    if request.method == 'POST':
        success = False
        media_id = -1
        if request.user.is_authenticated():
            try:
                success = delete_media(request.POST['delmedia'],request.user.id)
            except:
                success,media_id = handle_upload(request.FILES['media_file'], request.user.username,request.user.id)
        if(success):
            pass
            #media_msg =
        else:
            msg = "Ett fel uppstod när vi försökte ta hand om din bergäran. Försök igen senare!"

    start_media = []
    for m in Media.objects.filter(mediatype=Media.STARTMEDIA,user=request.user).order_by('order'):
        start_media.append(m.as_json())

    return render_to_response('editor/general.html',{'start_media':start_media,"msg":msg},context_instance=RequestContext(request))

@login_required
def render_page_media(request):
    return render(request, 'editor/media.html')

@login_required
def render_page_publish(request):
    start_media = []
    for m in Media.objects.filter(mediatype=Media.STARTMEDIA,user=request.user).order_by('order'):
        start_media.append(m.as_json())

    return render_to_response('editor/publish.html',{'start_media':start_media},context_instance=RequestContext(request))

@login_required
def render_page_addMedia(request):
    return render(request, 'editor/addMedia.html')

def handle_upload(f, username,user_id):
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
        os.mkdir(username+'/')
    except:
        pass

    #change to user folder
    os.chdir(username)
    folder = os.getcwd()

    #Fullpath to file
    fullpath = folder+"/"+f.name

    try:
        with open(fullpath,'wb+') as destination:
            for chunk in f.chunks():
                destination.write(chunk)
    except:
        return False

    #Name, Filepath, Size, Treasure
    userobject = User.objects.get(id=user_id)

    media_count = Media.objects.filter(mediatype=Media.STARTMEDIA,user=userobject).count()

    media = Media(name=f.name,
                  filepath=fullpath,
                  size=f.size,
                  treasure=False,
                  mediatype = Media.STARTMEDIA,
                  user=userobject,
                  order = media_count)
    media.save()
    if media.pk > 0:
        return True,media.pk
    else:
        return False

def delete_media(media_id,user_id):
    m = Media.objects.get(id=media_id)
    u = User.objects.get(id=user_id)
    print(m.user)
    print(u)
    if m.user.id == u.id or u.is_superuser:
        os.remove(m.filepath)
        m.delete()
        return True
    else:
        return False

