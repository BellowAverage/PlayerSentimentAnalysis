from django.shortcuts import render

# Test Section-----------------------------------------------------

def test(request):
    text = "This is a note from the template view function."
    context = {"text": text}

    return render(request, 'test.html', context)

# ---------------------------------------------------------
# rank_sqlGenerator section

def rank_sqlGenerator(request):
    return render(request, "rank_sqlGenerator.html")


def rank_sqlGenerator_form_handle(request):
    from ssrpg.utils.RankSqlGenerator import SQLGenerator

    profession = request.GET.get('profession', '')
    date = request.GET.get('date', '')
    noStudio = request.GET.get('noStudio')
    active3Days = request.GET.get('active3Days')

    generator = SQLGenerator(date=str(date), profession=str(profession), if_studio_flag=str(noStudio), if_active_days_3d=str(active3Days))
    sql_res = generator.generate_sql()
    
    # Prepare the context with the result of SQL generation
    context = {
        "profession": str(profession),
        "date": date,
        "noStudio": noStudio,
        "active3Days": active3Days,
        "sql_res": sql_res
    }

    return JsonResponse(context)

# ---------------------------------------------------------
# data_diagram section

def data_source_selection(request):
    if request.method == 'POST':

        selected_data_source = request.POST.get('data_source_selection')
        text_data = str(selected_data_source)

        try:
            
            with open('media/output.txt', 'w', encoding='utf-8') as file:

                file.write(text_data)
                sentiment_query(request)

            return JsonResponse({'status': 'success', 'message': 'Data source selected.'})
        
        except IOError as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})


def upload_handle(request):
    if request.method == 'POST':
        try:
            
            csv_file = request.FILES['csvFile']
            if not csv_file.name.endswith('.csv'):
                return JsonResponse({'error': '请上传.csv格式的文件~'}, status=400)

            data = pd.read_csv(csv_file, encoding='utf-8')
            directory = os.path.join(settings.BASE_DIR, 'data/ssrpg/')
            save_name = directory + str(csv_file.name)
            data.to_csv(save_name, encoding='utf-8', index=False)

            return JsonResponse({'success': '文件上传成功！'})
        
        except Exception as e:
            return JsonResponse({'error': f'文件上传失败：{str(e)}'}, status=500)

    return JsonResponse({'error': '未知错误，请联系管理员~'}, status=400)


def data_diagram(request):
    return render(request, "data_diagram.html")

# ---------------------------------------------------------
# sentiment_query section

from django.shortcuts import render, redirect, reverse
from django.http import HttpResponse, HttpResponseRedirect

import os
from django.conf import settings
from django.http import JsonResponse
import pandas as pd
from django.template.loader import render_to_string

def sl_sentiment(request):
    return render(request, "xd_menu.html")

def sentiment_query_init(request):
    text_query = ''
    min_length = '0'
    max_length = '100'
    sentiment_direction = 'all'
    minLength_level = '0'
    maxLength_level = '60'
    minLength_rmb = '0'
    maxLength_rmb = '100000'

    directory = os.path.join(settings.BASE_DIR, 'data/ssrpg/')
    
    file_names = []
    for filename in os.listdir(directory):
        file_names.append(filename)
    
    data_source_selection = "DesensitizedTestData.csv"
    # data_source_selection = "铃兰反馈数据_0325（默认数据，请勿删除）.csv"
    file_address = directory + data_source_selection
    df_res = pd.read_csv(file_address, usecols=["Source"])
    unique_values = df_res['Source'].unique().tolist()
    

    dict_return = {"text_query": text_query, "min_length": min_length,
                   "max_length": max_length, "sentiment": sentiment_direction, "IsFirst": "True",
                   "minLength_level": minLength_level,
                   "maxLength_level": maxLength_level, "minLength_rmb": minLength_rmb,
                   "maxLength_rmb": maxLength_rmb, "data_set_names": file_names, "unique_values": unique_values}
    
    return render(request, 'sentiment_query.html', {'dict_return': dict_return})


# this function is deprecated
'''
def sentiment_query_sql(request):
    from ssrpg.utils.mysqlconn import GetFromMySQL, GetFromMySQLNoPandas

    text_query_sql = request.GET.get('text_query_sql', '')

    query_results_list = GetFromMySQLNoPandas(text_query_sql)

    html = render_to_string('partials/search_results.html',
                            {'query_results': query_results_list})

    # Return the HTML snippet as a response
    return HttpResponse(html)
'''

def sentiment_query(request):
    # from ssrpg.utils.mysqlconn import GetFromMySQL, GetFromMySQLNoPandas
    # from ssrpg.utils.sqlGenerator import ljyGetFromMySql
    import os
    
    # Retrieve query parameters from the URL
    params = ['data_source_selection', 'text_query', 'min_length', 'max_length', 
            'sentiment_direction', 'minLength_level', 'maxLength_level', 
            'minLength_rmb', 'maxLength_rmb', 'sentiment_source']

    data_source_selection, text_query, min_length, max_length, sentiment_direction, \
    minLength_level, maxLength_level, minLength_rmb, maxLength_rmb, sentiment_source = \
        (request.GET.get(param, '') for param in params)

    directory = os.path.join(settings.BASE_DIR, 'data/ssrpg/')
    file_names = []
    for filename in os.listdir(directory):
        file_names.append(filename)


    # use sql (deprecated)

    '''
    query = ljyGetFromMySql(text_query, min_length, max_length, sentiment_direction, minLength_level, maxLength_level,
                            minLength_rmb,
                            maxLength_rmb)

    query_results_list = GetFromMySQLNoPandas(query)
    '''

    # use pandas
    directory = os.path.join(settings.BASE_DIR, 'data/ssrpg/')
    file_address = directory + data_source_selection
    df_res = pd.read_csv(file_address)


    # -------------------------------------------------------

    # filter by sentiment direction
    if sentiment_direction == "Positive":
        df_res = df_res[df_res["情感分类"] == "满意"]
    elif sentiment_direction == "Negative":
        df_res = df_res[df_res["情感分类"].isin(["不满", "极不满"])]

    # filter by text query
    if text_query:
        df_res = df_res[df_res["评论内容"].str.contains(text_query)]

    # transform to the supported data type
    min_length = int(min_length) if min_length else 0
    max_length = int(max_length) if max_length else float('inf')

    minLength_level = int(minLength_level) if minLength_level else 0
    maxLength_level = int(maxLength_level) if maxLength_level else float('inf')

    minLength_rmb = int(minLength_rmb) if minLength_rmb else 0
    maxLength_rmb = int(maxLength_rmb) if maxLength_rmb else float('inf')

    # filter by comment length, level, charge
    df_res = df_res[(df_res["评论内容"].str.len() >= min_length) &
                    (df_res["评论内容"].str.len() <= max_length)]

    df_res = df_res[(df_res["玩家等级"] >= minLength_level) &
                    (df_res["玩家等级"] <= maxLength_level)]

    df_res = df_res[(df_res["累计充值rmb"] >= minLength_rmb) &
                    (df_res["累计充值rmb"] <= maxLength_rmb)]
    
    
    # identify sources from which the sentiments are acquired
    unique_values = df_res['Source'].unique().tolist()
    
    if sentiment_source != "all":
        for value in unique_values:
            if sentiment_source == value:
                df_res = df_res[df_res["Source"] == value]


    query_results_list = df_res.to_dict(orient='records')
    # -------------------------------------------------------
    
    dict_return = {"text_query": text_query, "min_length": min_length,
                   "max_length": max_length, "sentiment": sentiment_direction, "minLength_level": minLength_level,
                   "maxLength_level": maxLength_level, "minLength_rmb": minLength_rmb,
                   "maxLength_rmb": maxLength_rmb, "sentiment_source": sentiment_source, "data_set_names": file_names, "unique_values": unique_values}

    html = render_to_string('partials/search_results.html',
                            {'query_results': query_results_list, 'dict_return': dict_return})

    # Return the HTML snippet as a response
    return HttpResponse(html)