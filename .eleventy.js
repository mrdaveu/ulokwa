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

   // Check if content has actual text (not just HTML tags/whitespace)
   eleventyConfig.addFilter("hasContent", (str) => {
     const text = str.replace(/<[^>]*>/g, '').trim();
     return text.length > 0;
   });
};