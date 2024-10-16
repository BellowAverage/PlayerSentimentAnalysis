import pandas as pd
import pymysql
from sqlalchemy import create_engine

def GetFromMySQL(query):
    # 创建数据库连接
    engine = create_engine('mysql+pymysql://ubuntu:123@localhost:3306/mysite_server')

    # 将查询结果存储在名为df的pandas dataframe中
    df = pd.read_sql_query(query, engine, index_col=None)

    # 输出df以查看结果
    return df

def GetFromMySQLNoPandas(query):
    connection = pymysql.connect(host='localhost', user='ubuntu', password='123', database='mysite_server',
                                 cursorclass=pymysql.cursors.DictCursor)

    # 执行查询并获取结果
    with connection.cursor() as cursor:
        cursor.execute(query)
        query_results_list = cursor.fetchall()

    # 关闭数据库连接
    connection.close()

    # 返回查询结果
    return query_results_list

