    <fieldset>
    <div class="row-fluid">
        <div class="control-group">
            <label class="control-label" for="title">Titel</label>
            <div class="controls">
                <input type="text" name="title" id="title" required class="input-large" />
            </div>
        </div>
    </div>
    <div class="row-fluid">
        <div class="control-group">
            <label class="control-label" for="text">Text</label>
            <div class="controls">
                <textarea name="text" id="text" required rows="5" class="input-xxlarge"></textarea>
            </div>
        </div>
    </div>

    <div class="row-fluid">
        <div class="control-group">
            <label class="control-label" for="extLink">Externer Link</label>
            <div class="controls">
                <input type="text" name="extLink" id="extLink" class="input-large" />
            </div>
        </div>
    </div>
</fieldset>

<input type="hidden" name="category" value="freetext" />