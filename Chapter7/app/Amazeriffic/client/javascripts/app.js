 
/*globals $*/
/*global document: false */
/* global io: true */

var socket = io();

var main = function(toDoObjects) {
   "use strict";
    console.log("SANITY CHECK");
    var toDos = toDoObjects.map(function(toDo) {
        return toDo.description;
    });

    $(".tabs a span").toArray().forEach(function(element) {
        var $element = $(element);

        $element.on("click", function() {
            var $content,  
                i; 
            $(".tabs a span").removeClass("active"); 
            $element.addClass("active"); 
            $("main .content").empty(); 
            
            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul id='freshList'>");
                for (i = toDos.length - 1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul id='agedList'>");
                toDos.forEach(function(todo) {
                    $content.append($("<li>").text(todo));
                });

            } else if ($element.parent().is(":nth-child(3)")) { 
                var tags = [];

                toDoObjects.forEach(function(toDo) {
                    toDo.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function(tag) {
                    var toDosWithTag = [];
                    toDoObjects.forEach(function(toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return {
                        "name": tag,
                        "toDos": toDosWithTag
                    };
                });

                console.log(tagObjects);

                tagObjects.forEach(function(tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul id='tagList'>");
                    tag.toDos.forEach(function(description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });

            } else if ($element.parent().is(":nth-child(4)")) { 
                var $input = $("<input>").addClass("description"),
                    $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: "),
                    $button = $("<span>").text("Add");

                $button.on("click", function() {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","), 
                        newToDo = {
                            "description": description,
                            "tags": tags
                        };

                    $.post("todos", newToDo, function(result) { 
                        console.log(result);

                        //toDoObjects.push(newToDo);
                        toDoObjects = result;

                        // update toDos
                        toDos = toDoObjects.map(function(toDo) {
                            return toDo.description;
                        });
                        //Empty the input text fields after user submits.
                        $input.val("");
                        $tagInput.val("");
                    });
                    socket.emit("+", newToDo);
                });

                $content = $("<div>").append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);
            }

            $("main .content").append($content);

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");

    
    socket.on("newToDO", function(data) {
        var $new = $("#freshList"),
            $old = $("#agedList"),
            $tagTab = $("#tagList"),
            $myDescription = data.description,
            $myTag = data.tags,
            $newItem = $("<li>").text($myDescription).hide();
        
        if (($new.length) > 0) {
            $new.prepend($newItem);
            $newItem.slideDown(500);
        } else if (($old.length) > 0) {
            $old.append($newItem);
            $newItem.slideDown(500);
        } else if (($tagTab.length) > 0) {
            $("main .content").append($("<h3>").text($myTag));
            $("main .content").append($newItem);
            $newItem.slideDown(500);
        }
        $.getJSON("todos.json", function(newToDoObjects) {
            toDoObjects = newToDoObjects;
            toDos = newToDoObjects.map(function(toDo) {
                return toDo.description;
            });
        });
    });
};
$(document).ready(function() {
    "use strict";
    $.getJSON("todos.json", function(toDoObjects) {
        main(toDoObjects);
    });
});
