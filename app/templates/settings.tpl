<div id="settingsModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <h3 id="myModalLabel">Einstellungen</h3>
  </div>
  <div class="modal-body">
    <form method="post" id="settingsForm" class="contentForm form-horizontal" novalidate>
    <fieldset>
    <div class="control-group">
        <label class="control-label" for="tvId">Smart TV Id</label>
        <div class="controls">
            <input name="tvId" value="{{tvId}}" type="text" placeholder="Geräte-Id" id="tvId" required class="input-large" />
        </div>
    </div>
    </fieldset>
</form>
  </div>
  <div class="modal-footer">
    <button class="btn" data-dismiss="modal">Abbrechen</button>
    <button class="btn btn-success" data-action="update-settings" data-dismiss="modal">Aktualisieren</button>
  </div>
</div>