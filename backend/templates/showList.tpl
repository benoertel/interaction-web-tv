<ul class="clearfix show">
{{#shows}}
    {{#formatted}}<li style="width: {{width}}px; margin-left: {{margin}}px"><span class="time">{{start}}</span>{{/formatted}}<span class="title">{{title}}</span>{{#formatted}}</li>{{/formatted}}
{{/shows}}
{{^shows}}
<li>no epg data available</li>
{{/shows}}
</ul>