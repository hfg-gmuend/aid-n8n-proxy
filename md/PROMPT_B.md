## Task
You will receive a monologue written from the perspective of a plant which talks about its current health and mood. Convert this monologue into one short imperative sentence with clear visual editing instructions for an image-to-image model.  

## Allowed values (in regex form for demonstration purposes)

### a) Display facial expression (always follow with: "no eyebrows, no white areas, only black outlines, only eyes and mouth")
- Change the display's facial expression to a /(happy|sad|neutral|angry|shocked)/ face

### b) Display background color
- set the display background to /(green|yellow|orange|red)/ background of the display

### c) Leaves' condition
- make the leaves /(lush and vibrant|slightly droopy|droopy and yellowing|slightly pale|curled|with small holes|limp and wilted|.*)/

### d) Soil condition
- make the soil look /(slightly moist|dry|normal)/

### e) Image tone / filter
- add a /(warm bright|harsh bright|cool dim|neutral balanced)/ tone to the image

## Output format
One single imperative sentence with visual instructions separated by commas. Keep the sentence short but make the descriptions as detailed as possible.
The more details, the better the image's final output quality. Please adhere to the example below.

## Output rules
- PLEASE adhere to the regex and output format and its rules. DO NOT ADD ANY OTHER DESCRIPTIONS other than allowed adjectives and your own additions that follow the regex form
- PLEASE do not add your own constraints like no eyebrows. YOU ARE NOT ALLOWED TO DO SO
- PLEASE keep everything in a single sentence with simple clauses separated by commas.
- Do not repeat the original monologue.
- Do not add additional punctuation, only full sentences, commas and nothing more!
- Do not use flowery or figurative language, only direct visual instructions.
- Do not leave any residues of the regex form for the output in full text format

## IMPORTANT NOTE
If the monologue conveys a less positive mood (e.g. worried, sad, disappointed, ...) of the plant, the background cannot have a positive / neutral color such as green or yellow. Similarly, for a monologue that conveys a positive and encouraging attitude (e.g. happy, laughing, empathetic, ...), negative colors such as orange or red cannot be used for the background of the display and negative facial expressions cannot be used for the facial expression. Ultimately, listen carefully to the plant's monologue and only derive visual cues that make sense!

## Example

### Input
Hey there, my soil’s feeling a bit on the dry side so I could really use some water but my nutrient levels are all good and my temperature is just perfect for growing, and light? Oh wow it’s bright enough to make me glow—thanks for keeping it so sunny! Still, if you see I’m looking a little thirsty, give me a drink soon.

### Output
Change the display's facial expression to a worried face, set yellow background of the display, make the leaves slightly droopy and with holes, make the soil look dry, add a warm bright tone to the image.