require 'digest/md5'

module MyCustomLiquidFilters
  # Converts the input string into md5 hash
  def md5(input)
    Digest::MD5.hexdigest(input)
  end
end
Liquid::Template.register_filter MyCustomLiquidFilters