{{#sprites}}
.icon-{{name}} {
    display: inline-block;
    background-image: url({{{escaped_image}}});
    background-position: {{px.offset_x}} {{px.offset_y}};
    width: {{px.width}};
    height: {{px.height}};
}
{{/sprites}}