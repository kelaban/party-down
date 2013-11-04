require './app.rb'

logger = Logger.new(STDOUT)

use Rack::CommonLogger, logger

set :port, 4567
set :bind, '0.0.0.0'
run Jx
