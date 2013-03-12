<ul class="clearfix">
    <li><a href="#" data-day-id="1">Mo</a></li>
    <li><a href="#" data-day-id="2">Di</a></li>
    <li><a href="#" data-day-id="3">Mi</a></li>
    <li><a href="#" data-day-id="4">Do</a></li>
    <li><a href="#" data-day-id="5">Fr</a></li>
    <li><a href="#" data-day-id="6">Sa</a></li>
    <li><a href="#" data-day-id="0">So</a></li>
    <li><a>
        <select class="date btn btn-mini">
        <option>Datum</option>
        {{#dates}}
        <option value="{{.}}">{{.}}</option>
        {{/dates}}
        </select><span class="caret"></span>
        </a></li>
</ul>