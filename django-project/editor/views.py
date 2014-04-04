import os
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from editor.models import Media
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
            print(username)
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
    folder = os.path.join(PROJECT_ROOT, 'users/'+username+'/')
    try:
        os.mkdir(folder)
    except:
        pass

    fname = f.name  # samma så why?
    fullpath = folder+f.name
    with open(folder+f.name,'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    #Name, Filepath, Size, Treasure
    media = Media(name=fname,filepath=fullpath,size=f.size)
    media.save()
    return True



