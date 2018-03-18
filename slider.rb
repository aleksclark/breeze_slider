# myapp.rb
require 'sinatra/base'
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

class SliderApp < Sinatra::Application
  @@cached_events = nil
  @@cache_time = nil

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
    json cached_events
  end

  get '/' do
    send_file File.join(settings.public_folder, 'index.html')
  end

  def cached_events
    if @@cached_events && (Time.now < (@@cache_time + 600))
      @@cached_events
    else
      @@cache_time = Time.now
      @@cached_events = generate_events
    end
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

    # combined_events = {}
    # cal_events.values.each do |ev|
    #   combined_events[ev.uid] = {
    #     description: ev.description,
    #     name: ev.summary,
    #     start_datetime: ev.dtstart,
    #   }
    # end

    combined_events = {}
    (cal_events.keys & api_events.keys).each do |key|
      combined_events[key] = api_events[key]
      fmt_description = cal_events[key].description
      if fmt_description.is_a? Icalendar::Values::Array
        fmt_description = fmt_description.join('')
      end
      combined_events[key]['description'] = fmt_description
      combined_events[key]['start_datetime'] = cal_events[key].dtstart
      combined_events[key].each_pair do |k, v|
        if v.is_a?(String) || v.is_a?(Icalendar::Values::Text)
          combined_events[key][k] = v.to_s.force_encoding(Encoding::UTF_8)
        end
      end
    end

    combined_events.values.sort_by {|ev| ev['start_datetime']}
  end

  def gen_uid(event)
    dt = DateTime.parse(event['start_datetime'])
    fmttime = dt.strftime('%Y%m%dT%H%M%S')
    fmttime + 'ZPID' + event['id'] + '@newheightschapel.breezechms.com'
  end
end
