---
layout: default
---

# Upload New Post

<form id="create-form">
    <label>Title</label><br />
    <input required type="text" name="title" /><br /><br />
    <label>Date</label><br />
    <input required type="date" name="date" /><br /><br />
    <label>Author</label><br />
    <input required type="text" name="author" /><br /><br />
    <input required type="file" accept="image/*" name="image"><br />
    <textarea name="content" cols="50" rows="10"></textarea><br /><br />
    <input type="submit" value="Submit" />
</form>

<script>
'use strict';

$(function () {

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/backpack/login";
        return
    }

    $("#create-form").submit(function(event) {
        event.preventDefault();

        jQuery.ajax({
            url: 'https://api-backpack.herokuapp.com/',
            headers: {
                'Authorization': localStorage.getItem('token'),
            },
            data: new FormData(this),
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            error: function() {
                alert('Sorry! Something has gone wrong.');
            },
            success: function(token){
                window.setTimeout(function() {
                    window.location.href = "/backpack/"
                }, 5000);
                alert('Success! Your post should appear in the next couple of minutes.');
            }
        });
    });
});

</script>
