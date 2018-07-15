---
layout: default
---

# Login

<form id="login-form">
    <label>Username</label><br />
    <input required type="text" name="username" /><br /><br />
    <label>Password</label><br />
    <input required type="password" name="password" /><br /><br />
    <input type="submit" value="Login" />
</form>

<script>
'use strict';

$(function () {
    $("#login-form").submit(function(event) {
        event.preventDefault();

        jQuery.ajax({
            url: 'https://api-backpack.herokuapp.com/login',
            data: new FormData(this),
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            error: function() {
                alert('Sorry! Something has gone wrong.');
            },
            success: function(token) {
                localStorage.setItem('token', token);
                window.location.href = "/new";
            }
        });
    });
});

</script>
