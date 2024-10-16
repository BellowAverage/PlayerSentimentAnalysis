from django.urls import path
from . import views

urlpatterns = [
    path('test', views.test, name='test'),
    path('sentiment_query/query/', views.sentiment_query, name='sentiment_query'),
    # path('sentiment_query/querysql/', views.sentiment_query_sql, name='sentiment_query_sql'),
    path('sentiment_query/', views.sentiment_query_init, name='sentiment_query_init'),
    path('SLSentiment', views.sl_sentiment, name='sl_sentiment'),
    path('data_source_selection/', views.data_source_selection, name='data_source_selection'),
    path('RankSqlGenerator', views.rank_sqlGenerator, name='rank_sqlGenerator'),
    path('RankSqlGenerator/generate/', views.rank_sqlGenerator_form_handle, name='rank_sqlGenerator_form_handle'),
    path('DataDiagram', views.data_diagram, name='data_diagram'),
    path('upload_handle/', views.upload_handle, name='upload_handle'),
]