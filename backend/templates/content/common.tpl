<form method="post" id="contentTextForm" class="contentForm" novalidate>
    <h3>Zusatzinhalt anlegen</h3>
    <div class="row-fluid">
        <fieldset class="span6">
            <legend>Laufzeit</legend>
            <div class="row-fluid">
                <div class="control-group span6">
                    <label class="control-label" for="startDate">Start</label>
                    <div class="controls input-datetime input-append date">
                        <input 
                            name="startDate" type="text" id="startDate" required class="input-block-level"
                            data-validation-regex-regex="([0-9]{2}).([0-9]{2}).([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})" 
                            data-validation-regex-message="Format 31.01.2012 14:30:20." />
                        <span class="add-on">
                            <i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>
                        </span>
                    </div>
                </div>

                <div class="control-group span6">
                    <label class="control-label" for="endDate">Ende</label>
                    <div class="controls input-datetime input-append date">
                        <input name="endDate" type="text" id="endDate" required class="input-block-level"
                               data-validation-regex-regex="([0-9]{2}).([0-9]{2}).([0-9]{4}) ([0-9]{2}):([0-9]{2}):([0-9]{2})" 
                               data-validation-regex-message="Format 31.01.2012 14:30:20." />
                        <span class="add-on">
                            <i data-time-icon="icon-time" data-date-icon="icon-calendar"></i>
                        </span>
                    </div>
                </div>
            </div>
        </fieldset>

        <fieldset class="span6">
            <legend>Zielgruppe</legend>
            <div class="row-fluid">
                <div class="control-group span6">
                    <label class="control-label" for="sex">Geschlecht</label>
                    <div class="controls">
                        <select name="sex" id="sex" required class="input-block-level">
                            <option value="all">männlich und weiblich</option>
                            <option value="male">männlich</option>
                            <option value="female">weiblich</option>
                        </select>
                    </div>
                </div>
                <div class="control-group span6">
                    <label class="control-label" for="ageRange">Altersbereich</label>
                    <div class="controls">
                        <select name="ageRange" id="ageRange" required class="input-block-level">
                            <option value="all">Alle</option>
                            <option value="children">Kinder 6 – 13 Jahre</option>
                            <option value="teenager">Jugendliche 14 – 29 Jahre</option>
                            <option value="adults">Erwachsene 30 – 49 Jahre</option>
                            <option value="elderly">Ältere Erwachsene ab 50 Jahre</option>
                        </select>
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
    <div class="row-fluid">
    <fieldset class="span6">
        <legend>Inhaltstyp</legend>
        <div class="row-fluid">
            <div class="control-group span6">
                <label class="control-label" for="contentType">Typ</label>
                <div class="controls">
                    <select name="contentType" id="contentType" required class="input-block-level">
                        {{#contentTypes}}
                        <option value="{{id}}">{{label}}</option>
                        {{/contentTypes}}

                    </select>
                </div>
            </div>
        </div>
    </fieldset>
    </div>
    
    <div id="custom-form"></div>
    
        <fieldset>
    <input type="hidden" name="type" value="content" />
    
    <div class="form-actions">
        <button value="submit" class="btn btn-primary" type="submit">Speichern</button>
    </div>
    </fieldset>
</form>