{{#targets}}
<ul class="clearfix content">
    <span class="target-group {{name}}">&nbsp;</span>
{{#contents}}
    {{#formatted}}<li data-toggle="popover" data-placement="top" data-content="{{label}}" title="" data-original-title="{{start}} - {{end}}" style="width: {{width}}px; margin-left: {{margin}}px"><span class="time">{{start}}</span>{{/formatted}}{{label}}{{#formatted}}</li>{{/formatted}}
{{/contents}}
</ul>
{{/targets}}