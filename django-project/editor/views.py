from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def render_page(request):
    return render(request, 'editor/editor.html')

