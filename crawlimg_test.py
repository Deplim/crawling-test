import requests
from bs4 import BeautifulSoup

lv1_url = 'https://askdjango.github.io/lv1/'
html = requests.get(lv1_url).text
print(html)
soup = BeautifulSoup(html, 'html.parser')

for a_tag in soup.select('#course_list .course a'):
    print(a_tag.text, a_tag['href'])