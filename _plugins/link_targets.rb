# Open destination pages and documents in new tabs, preserving section navigation.
require 'nokogiri'

Jekyll::Hooks.register [:pages, :documents], :post_render do |page|
  next unless page.output_ext == '.html'

  html = Nokogiri::HTML(page.output)
  html.css('a[href]').each do |link|
    href = link['href'].strip
    next if href.empty? || href.start_with?('#', 'mailto:', 'tel:', 'javascript:')
    next if link['data-section'] || href.start_with?("#{page.site.baseurl}/#")
    next unless href.match?(%r{\A(?:https?://|/|[^:]+\z)})

    link['target'] = '_blank'
    link['rel'] = ((link['rel'] || '').split + %w[noopener noreferrer]).uniq.join(' ')
  end
  page.output = html.to_html
end
