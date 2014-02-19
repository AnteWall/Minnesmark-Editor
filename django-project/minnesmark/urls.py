from django.conf.urls import patterns, include, url
from minnesmark.views import register_account
from minnesmark.views import approveUser
from django.contrib.auth.views import login
from django.views.generic import TemplateView
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    #Redirects to Login
    url(r'^$', RedirectView.as_view(url='/accounts/login'),name="index"),

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
    url(r'^accounts/register$', register_account,name="register"),

    # Testing
    #url(r'^date/$', current_datetime)
)
