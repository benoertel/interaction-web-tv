{{#targets}}
<ul class="clearfix content">
    <span class="target-group {{name}}">&nbsp;</span>
{{#contents}}
    {{#formatted}}<li style="width: {{width}}px; margin-left: {{margin}}px"><span class="time">{{start}}</span>{{/formatted}}{{label}}{{#formatted}}</li>{{/formatted}}
{{/contents}}
</ul>
{{/targets}}