<div id="signupModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <h3 id="myModalLabel">Registrierung</h3>
  </div>
  <div class="modal-body">
    <form method="post" id="signupForm" class="contentForm form-horizontal" novalidate>
    <fieldset>
    <div class="control-group">
        <label class="control-label" for="start">Benutzername</label>
        <div class="controls">
            <input name="username" type="text" placeholder="Benutzername" id="username" required class="input-large" />
        </div>
    </div>
    
    <div class="control-group">
        <label class="control-label" for="end">Passwort</label>
        <div class="controls">
            <input name="password" type="password" placeholder="Passwort" id="password" required class="input-large" />
        </div>
    </div>

    <div class="control-group">
        <label class="control-label" for="end">Alter</label>
        <div class="controls">
            <input name="age" type="text" placeholder="Alter" id="age" required class="input-large" />
        </div>
    </div>

    <div class="control-group">
        <label class="control-label" for="end">Geschlecht</label>
        <div class="controls">
            <select name="sex" type="sex" id="sex" required class="input-large">
            <option value="">bitte wählen</option>
            <option value="male">männlich</option>
            <option value="female">weiblich</option>
            </select>
        </div>
    </div>
    </fieldset>
</form>
  </div>
  <div class="modal-footer">
    <button class="btn" data-dismiss="modal" data-action="login">Einloggen</button>
    <button class="btn btn-success" data-action="register-user">Account erstellen</button>
  </div>
</div>