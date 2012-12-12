<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">        <meta name="description" content="">
        <meta name="author" content="">

        <link href="/resources/css/bootstrap.css" rel="stylesheet">
        <link href="/resources/css/bootstrap-responsive.css" rel="stylesheet">
        <link href="/resources/css/jquery.dragscroll.css" rel="stylesheet">

        <link href='http://fonts.googleapis.com/css?family=Quicksand' rel='stylesheet' type='text/css'>

        <script src="http://code.jquery.com/jquery-latest.js"></script>
        <script src="/resources/js/bootstrap.min.js"></script>
        <script src="/resources/js/jquery.mousewheel.js"></script>
        <script src="/resources/js/jquery.dragscroll.min.js"></script>

        <title></title>

        <style type="text/css">
            body {
                /*font-family: 'Quicksand', sans-serif;*/
                background-color: #bfb093;
                /*color: white;
                */padding-top: 40px;
                position: relative;
            }

            @media (max-width: 979px) {
                body {
                    padding-top: 0;  
                }
            }

            .slider {
                color: white;
                display:block;
                width : 100%;
                overflow:hidden;
                background-color: #73161e;
                height: 90px;
                line-height: 90px;
                border-radius: 4px;
                background-image: -moz-linear-gradient(top, #73161e, #5f1219);
                background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#73161e), to(#5f1219));
                background-image: -webkit-linear-gradient(top, #73161e, #5f1219);
                background-image: -o-linear-gradient(top, #73161e, #5f1219);
                background-image: linear-gradient(to bottom, #73161e, #5f1219);

                -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .slider .spacer {
                margin: 0 35px;
            }

            .slider-inner {
                width:2200px;
                height:auto;
            }
            .slider .left-arrow,
            .slider .right-arrow {
                width: 30px;
                background-color: #bf0f30;
                text-align: center;
                display: block;
                color: #ffffff;

                background-image: -moz-linear-gradient(top, #bf0f30, #a40e2a);
                background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#bf0f30), to(#a40e2a));
                background-image: -webkit-linear-gradient(top, #bf0f30, #a40e2a);
                background-image: -o-linear-gradient(top, #bf0f30, #a40e2a);
                background-image: linear-gradient(to bottom, #bf0f30, #a40e2a);

                -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            .slider .left-arrow {
                float: left;
            }
            .slider .right-arrow {
                float: right;
            }

            .slider.timeline .item {
                width: 300px;
                display: inline-block;
            }
            .slider.tv-channels {
                height: 40px;
                line-height: 40px;
                margin-bottom: 5px;
            }
            .slider.tv-channels .item {
                margin-right: 10px;
                display: inline-block;
            }

            .slider.tv-channels img {
                max-height: 27px;
            }

            .control-bar {
                background-color: #73161e;
                padding: 10px;
                border-radius: 4px;

                background-image: -moz-linear-gradient(top, #73161e, #5f1219);
                background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#73161e), to(#5f1219));
                background-image: -webkit-linear-gradient(top, #73161e, #5f1219);
                background-image: -o-linear-gradient(top, #73161e, #5f1219);
                background-image: linear-gradient(to bottom, #73161e, #5f1219);

                -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
            }
            
            .viewport.container {
                margin: 0 -15px;
            }


        </style>
        <script>
            $(document).ready(function() {/*
                $('.slider.timeline .right-arrow').click(function(){
                    moveTimeline('right')
                });
                $('.slider.timeline .left-arrow').click(function(){
                    moveTimeline('left')
                });
                
                function moveTimeline(direction) {
                    var left = $('.days').position().left;
                    if(direction == 'right') {
                        left -= 120;
                        
                    } else {
                        left += 120;
                        if(left > 20) {
                            left = 20;
                        }
                    }
                    $('.days').animate({ left: left + 'px' }, 300);
                }
                
                $('.slider.tv-channels .right-arrow').click(function(){
                    moveChannel('right')
                });
                $('.slider.tv-channels .left-arrow').click(function(){
                    moveChannel('left')
                });
                
                function moveChannel(direction) {
                    var left = $('.channels').position().left;
                    if(direction == 'right') {
                        left -= 120;
                        
                    } else {
                        left += 120;
                        if(left > 20) {
                            left = 20;
                        }
                    }
                    $('.channels').animate({ left: left + 'px' }, 300);
                }
 */
                $('.slider.timeline .spacer').dragscroll({
                    scrollBars: false
                });
                $('.slider.tv-channels .spacer').dragscroll({
                    scrollBars: false
                });
            });
        </script>
    </head>
    <body>
        <div class="navbar  navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container">
                    <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="brand" href="/">Persad</a>
                    <div class="nav-collapse collapse">
                        <ul class="nav">
                            <li class="">
                                <a href="#">Home</a>
                            </li>
                            <li class="">
                                <a href="#">Shows verwalten</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="container viewport">
            <h1>Welcome</h1>
            <div class="slider tv-channels">
                <a class="left-arrow" href="#"><</a>
                <a class="right-arrow" href="#">></a>
                <div class="spacer">
                    <div class="slider-inner">
                        <div class="item"><img src="/resources/img/tv-channel-logos/RTL.png" title="RTL" /></div>
                        <div class="item"><img src="/resources/img/tv-channel-logos/RTL2.png" title="RTL2" /></div>
                        <div class="item"><img src="/resources/img/tv-channel-logos/Das Erste.png" title="ARD" /></div>
                        <div class="item"><img src="/resources/img/tv-channel-logos/ZDF.png" title="ZDF" /></div>
                    </div>
                </div>
            </div>

            <div class="slider timeline">
                <a class="left-arrow" href="#"><</a>
                <a class="right-arrow" href="#">></a>
                <div class="spacer">
                    <div class="slider-inner">
                        <div class="item">monday</div>
                        <div class="item">tuesday</div>
                        <div class="item">wednesday</div>
                        <div class="item">thursday</div>
                        <div class="item">friday</div>
                        <div class="item">satuarday</div>
                        <div class="item">sunday</div>
                    </div>
                </div>
            </div>

            <div style="height: 200px; background-color: #cabca1;"></div>
            <div class="control-bar">
                <a href="#myModal" class="btn" type="button" data-toggle="modal"><i class="icon-plus-sign"></i> Add content</a>
                <button class="btn btn-primary" type="button"><i class="icon-plus-sign icon-white"></i> Default button</button>
            </div>
        </div>


        <!-- Modal -->
        <div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3 id="myModalLabel">Modal header</h3>
            </div>
            <div class="modal-body">
                <p>One fine body…</p>
            </div>
            <div class="modal-footer">
                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
                <button class="btn btn-primary">Save changes</button>
            </div>
        </div>
    </body>
</html>
