<div id="loginModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <h3 id="myModalLabel">Einloggen</h3>
  </div>
  <div class="modal-body">
    <form method="post" id="loginForm" class="contentForm form-horizontal" novalidate>
    <fieldset>
    <div class="control-group">
        <label class="control-label" for="username">Benutzername</label>
        <div class="controls">
            <input name="username" type="text" placeholder="Benutzername" id="username" required class="input-large" />
        </div>
    </div>
    
    <div class="control-group">
        <label class="control-label" for="password">Passwort</label>
        <div class="controls">
            <input name="password" type="password" placeholder="Passwort" id="password" required class="input-large" />
        </div>
    </div>
    </fieldset>
</form>
  </div>
  <div class="modal-footer">
    <button class="btn" data-action="signup">Registrieren</button>
    <button class="btn btn-success" data-action="login-user">Einloggen</button>
  </div>
</div>