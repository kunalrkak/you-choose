import requests
import random
import json
import time
import os
from flask import Flask, render_template, session, redirect, url_for, escape, request

app = Flask(__name__, static_folder='../build/static', template_folder='../build')
app.secret_key = os.environ['SECRET']


@app.route('/')
def index():
    # Simply return homepage
    return render_template('index.html')

@app.route('/r', methods=['POST'])
def r():
    if request.method == 'POST':
        url = 'https://api.yelp.com/v3/businesses/search'

        post_data = request.data
        data_dict = json.loads(post_data)

        # Grab data from POST request
        user_price = data_dict['params']['price']
        user_dist = data_dict['params']['distance']
        user_lat = data_dict['params']['lat']
        user_lon = data_dict['params']['lon']

        # Add user data to query string
        querystring = {'categories':'restaurants','radius':user_dist,'price':user_price,'open_now':'true','limit':'1','latitude':user_lat,'longitude':user_lon}

        payload = ''
        headers = {
            'Authorization': os.environ['API_KEY'],
            'cache-control': 'no-cache',
            }

        # If new search query, flush "cache"
        if 'price' not in session or session['price'] != user_price or session['dist'] != user_dist or session['time'] < int(time.time()) or len(session['prev']) == 0:

            response = requests.request('GET', url, data=payload, headers=headers, params=querystring)

            session['price'] = user_price
            session['dist'] = user_dist
            session['total'] = min(150, int(json.loads(response.text)['total']))
            session['time'] = int(time.time()) + 260 # A couple minutes into the future
            session['prev'] = []

        if session['total'] > 1:
            # Choose a restaurant that hasn't been seen in the last three random picks
            while True:
                selection = random.randint(0, session['total']-1)
                if selection not in session['prev'] or session['total'] <= 3:
                    break

            # Manage queue with last seen restaurants
            if len(session['prev']) >= 3:
                session['prev'].pop()
            session['prev'] = [selection] + session['prev']

            querystring['offset'] = selection
            querystring['sort_by'] = 'rating'

            # Make a (second potential) query for actual random restaurant
            response = requests.request('GET', url, data=payload, headers=headers, params=querystring)

        return response.text

    else:
        return '500: SoMeThInG wEnT wRoNg'

if __name__ == '__main__':
    app.run()
