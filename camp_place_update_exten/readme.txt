
<네이버 플레이스 크롤링 확장 프로그램>
 

* 이미 서버의 db 에 들어있는 캠핑장의 내용을 업데이트하기 위해 사용되는 프로그램입니다.
* 현제 네이버 플레이스 크롤링이 막혀있어 확장 프로그램을 이용해 페이지를 직접 열어 크롤링하도록 한 것.
* 한 페이지당 약 2.5 초 소요. 시간은 코드의 setTimeout 부분을 수정하여 조절할 수 있음.


(1) 파일구조

  manifest.json 은 확장프로그램에 필수적으로 필요한 설정 파일이며, 나머지 파일들은 
  content_scripts js 파일들이다. 각각 특정 url 에서 동작하도록 설정되어 있으며, 자동모드로 실행하면

  1. http://hushit.live/service/post_page.html
     페이지에서 현제 크롤링 된 결과 보내기
  2. 크롤링 대상 주소를 받기 
  3. https://www.naver.com/ 로 이동
  4. 이 페이지를 기준점으로 대상 크롤링 페이지들을 하나씩 열어 결과들을 저장
  5. 다시 http://hushit.live/service/post_page.html
     로 이동해서 1 번 실행

  의 과정을 반복하게 된다.

  만약 자동모드가 아니라면 각 과정을 직접 버튼을 누르며 실행할 수 있으며, 정해진 갯수만큼의 페이지만
  크롤링한다.
  

* 두 페이지를 왔다갔다해야하는 이유:
   현제 주소를 받고 저장하는 서버는 https 가 아닌 http 이기 때문에 https 페이지에서 요청을 보낼 수 
   없다. 
   동시에 현제의 방식대로 기준 페이지를 두고 크롤링 대상 주소의 페이지를 열어 필요한 정보를 얻어오기
   위해서는 chrome web security 를 해제해야 하는데, 이렇게 해도 같은 프로토콜이 아니면 자바스크립트
   로 다른 주소의 윈도우에 접근하는게 불가능하기 때문에
   불가피하게 서버에 접근할 페이지와 크롤링을 할 기준 페이지를 분리해야 했다.


* 크롤링 기준 페이지 자동 새로고침 이슈
   기준이 되는 페이지인 https://www.naver.com/ 가 자동으로 새로고침이 되서 크롤링이 멈추는 문제가 있어
   윈도우의 beforeunload 이벤트의 리스너로 새로고침을 막고 콘솔창에 "새로고침 시도\n\n\n" 을 출려하도록 함.


* 윈도우 오픈 관련 오류 이슈.
   현제 대상 주소와 연 페이지의 주소가 같지 않다면 예외처리를 하는데. 
   현제 한번 크롤링을 할때 5% 정도씩의 페이지에서 이 오류가 나며, 크롤링이 안되는 대부분이 원인이 이것이다.
   예외처리를 하고 다음 순서의 크롤링때 다시 가져오면 크롤링이 되기에 당장 크롤링을 하는데 문제는 없으나
   해결하지 못함.


(2) 사용법

  * 서버에서 크롤링 대상을 넘겨주는 것은 root\var\www\html\service\camper\api\v1_crawling\get_list_todo_detail_naver_javascript.php
    크롤링 결과를 받는 것은 root\var\www\html\service\camper\api\v1_crawling\set_naver_detail_javascript.php
    에서 수정할 수 있다.
    현제 크롤링 대상은 "SELECT * FROM CampGround WHERE isDelete=0 and source='naverplace' order by updateDate asc limit (한번에 가져올 갯수);
    으로 뽑으며, 업데이트 날짜 기준으로 계속 돌아가게 된다.
    크롤링 도중 오류가 생긴것들은 업데이트가 되지 않는다.
    

  1. 확장 프로그램 폴더가 있다면 크롬에서 확장프로그램 페이지로 들어가 폴더를 등록
  2. http://hushit.live/service/post_page.html 주소로 이동
  3. auto flag 전환 버튼을 눌러 모드 설정 (on 이면 자동 모드)
  4. 자동 모드라면 get_address 한번만 누르면 이후 계속 자동으로 돈다.
  5. 수동 모드라면 get_address 를 눌러 크롤링 대상 주소들을 받고,  https://www.naver.com/
      으로 이동해 naver crawling 버튼을 누르면 정해진 갯수만큼 결과가 저장된다. 
      다시 http://hushit.live/service/post_page.html
      로 이동해 db update 를 누르면 결과를 보낼 수 있고, 응답으로 입력 결과 관련한 정보들을 보여주도록 하였다.
   

  * 각 과정에서 콘솔창에 진행상황을 보여주도록 하였다. 특히 수동모드에서 get_address 를 할 때는 페이지를 연 
     직후에 누르면 오류가 나는 경우가 있으니 한번더 새로고침 하고 콘솔창에서 제대로 갯수만큼의 주소들이 
     출력되는지 확인할 것. 
      
  

