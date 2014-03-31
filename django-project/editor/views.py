from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def render_page(request):
    return render(request, 'editor/editor.html')

@login_required
def render_page_general(request):
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


