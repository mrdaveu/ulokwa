module.exports = function(eleventyConfig) {
   const markdownIt = require("markdown-it");
   const md = markdownIt({
     html: true,
     breaks: true,
     linkify: true
   });
   eleventyConfig.setLibrary("md", md);
   eleventyConfig.addPassthroughCopy("stylesheet.css");
   eleventyConfig.addPassthroughCopy("photos");
};