import pandas as pd
from flask import Flask, render_template, url_for
import json

import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

data = {'Name': ['John', 'Mike', 'Sara'], 'Age': [26, 30, 27]}
df = pd.DataFrame(data)
app.config['TEMPLATES_AUTO_RELOAD'] = True




def load_selected_df():
    # load dataframe
    df = pd.read_csv("./static/data/corr_df.csv")

    # W select 40 countries
    cc = pd.read_csv("./static/data/countrycodes.csv")
    cc_eu = cc[cc['region'] == 'Europe']
    cc_selected = cc_eu[0:44] # 40 countries
    #print(cc_selected)

    filter_key = 'Country Code'
    df_filtered = df[df[filter_key].isin(cc_selected['alpha-3'])]
    return df_filtered


def scale_df(df):
    # W scale data
    scaler = StandardScaler()
    #print(df)
    df_scaled_features = scaler.fit_transform(df.iloc[:, 3:].to_numpy())
    #print(df_scaled_features)
    df.iloc[:, 3:] = df_scaled_features
    #print(df)
    return df
    ## does give a pandas warning but i think the copy/set of scaled columns works as intended


def pca_df(df):
    # based of data from the most recent year
    year = 2016 # max(df['year']) # the year 2020 does not contain any real data
    #print(year)
    # print(len(df["Country Name"].drop_duplicates()))
    df_x = df[df['year'] == year]
    # print(len(df_x["Country Name"].drop_duplicates()))
    # scale
    df_x = scale_df(df_x)
    # print("df_x with scale")
    # print(len(df_x))
    #pca
    #print(df_x)
    # print(df_x)
    pca = PCA(n_components=2)
    # pca.fit(df_x.iloc[:, 3:])
    pca_features = pca.fit_transform(df_x.iloc[:, 3:])
    # print(pca_features)
    # print(len(pca_features))
    # print("pca")
    # print(pca.components_)
    # print(len(pca.components_[0]))
    # print(pca.explained_variance_ratio_)
    # print(pca.singular_values_)
    # print(pca.components_)

    # make serializable and add countries and year
    # x_y = pca.components_.tolist()
    x_y = [[x_y[0] for x_y in pca_features], [x_y[1] for x_y in pca_features]]
    #print(x_y)
    countries = df_x['Country Code'].tolist()
    countrie_names = df_x["Country Name"].tolist()
    # into_one = list(zip(countries, x_y[0], x_y[1]))
    #print(into_one)
    # data = {'year': year, 'countries': [{'country': country, 'x': x, 'y': y} for country, x ,y in into_one]}
    # for c in data['countries']:
    # print(c)
    data = {'year': year, 'countries': countries,'country_names': countrie_names, 'x': x_y[0], 'y': x_y[1]}
    print(len(countries), len(pca_features))
    return data



def df_to_json(df):
    # turn into json format
    return json.dumps(df.to_dict(orient='records'))


@app.route('/')
def index():  # put application's code here
    # replace this with the real data
    # testData = ["hello", "infovis", "2023"]

    '''
    step 1
    Load df
    select 40 countries; return to client
    step 2
    select most recent year
    scale (only selected data)
    do pca(2D plot so only two components); return 2D coordinates to client

    '''
    df2 = load_selected_df()
    pca = pca_df(df2)

    return render_template('index.html', dataset_table=df2.to_html(classes='data'), dataset=df_to_json(df2), pca=json.dumps(pca))


if __name__ == '__main__':
    app.run(debug=True)
