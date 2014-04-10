from django.conf.urls import patterns, include, url
from minnesmark.views import register_account
from editor.views import render_page
from editor.views import render_page_general
from editor.views import render_page_media
from editor.views import render_page_publish
from editor.views import render_page_addMedia
from editor.views import create_route, save_route_to_database

from minnesmark.views import approveUser
from django.views.generic import RedirectView

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    #Redirects to Login
    url(r'^$', RedirectView.as_view(url='/accounts/login'),name="index"),

    #Redirects to Editor after login
    url(r'^accounts/profile/', RedirectView.as_view(url='/editor/general')),

    # Examples:
    #url(r'^/$', 'minnesmark.views.home', name='home'),
    # url(r'^minnesmark/', include('minnesmark.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/approve', approveUser),

    # url for Login Page using Django built in login
    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),
    url(r'^accounts/logout$', 'django.contrib.auth.views.logout_then_login'),
    url(r'^accounts/register$', register_account, name="register"),

    #url for the editor
    url(r'^editor/stations/$', render_page),
    url(r'^editor/general/$', render_page_general),
    url(r'^editor/media/$', render_page_media),
    url(r'^editor/media/station/$', render_page_addMedia),
    url(r'^editor/publish/$', render_page_publish),

    #url for database
    url(r'^editor/saveRouteDB', save_route_to_database),
    url(r'^editor/createRoute', create_route),

    # Testing
    #url(r'^date/$', current_datetime)
)
