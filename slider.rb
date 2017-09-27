# myapp.rb
require 'sinatra'
require 'sinatra/reloader'
require 'sinatra/json'
require 'sinatra/config_file'
require 'faraday'
require 'yaml'

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
  params = {
    start: '2017-9-1',
    end:   '2017-9-31'
  }
  json api_get('/api/events', params)
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end



