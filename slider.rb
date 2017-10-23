# myapp.rb
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/json'
require 'sinatra/config_file'
require 'faraday'
require 'yaml'
require 'icalendar'

# required keys:
# api_key - api key for breeze chms
# api_url - api endpoint for your breeze instance, e.g. https://mychurch.breezechms.com/

config_file 'config.yml'

API_METHODS =
  %w(
    delete
    post
    put
    get
  ).freeze

API_METHODS.each do |name|
  define_method(('api_' + name).to_sym) do |url, params=nil|
    api_request(name.to_sym, url, params)
  end
end

def api_request(meth, url, params)
  resp = connection.send(meth, url, params) do |req|
    req.headers['Api-Key'] = settings.api_key
    req.headers['Content-Type'] = 'application/json'
  end

  JSON.parse(resp.body)
end

set :static_cache_control, "max-age=0, private, must-revalidate"

def connection
  @conn ||= Faraday.new(url: settings.api_url)
end

before do
  headers "Cache-Control" => "max-age=0, private, must-revalidate"
end

get '/events' do
  json generate_events.values
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

def generate_events
  resp = Faraday.get settings.ical_urls[0]
  cal = Icalendar::Calendar.parse(resp.body).first
  params = {
    start: Date.today.strftime,
    end:   (Date.today + 30).strftime
  }

  cal_events = {}
  cal.events.each {|e| cal_events[e.uid] = e}

  api_events = {}
  api_get('/api/events', params).each {|e| api_events[gen_uid(e)] = e}

  combined_events = {}
  (cal_events.keys & api_events.keys).each do |key|
    combined_events[key] = api_events[key]
    combined_events[key]['description'] = cal_events[key].description
  end

  combined_events
end

def gen_uid(event)
  dt = DateTime.parse(event['start_datetime'])
  fmttime = dt.strftime('%Y%m%dT%H%M%S')
  fmttime + 'ZPID' + event['id'] + '@newheightschapel.breezechms.com'
end
