FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html 404.html style.css main.js /usr/share/nginx/html/
COPY assets/valley-day.webp assets/valley-night.webp assets/favicon.svg /usr/share/nginx/html/assets/
COPY assets/owl-flight.webp assets/owl-rest-v2.webp /usr/share/nginx/html/assets/
COPY map.js map.css /usr/share/nginx/html/
COPY assets/world-map-day.webp assets/world-map-night.webp assets/traveller.webp /usr/share/nginx/html/assets/
COPY about.html investments.html reading.css reading.js /usr/share/nginx/html/
COPY blog.html /usr/share/nginx/html/
COPY posts/inside-every-man-there-are-two-wolves.html posts/ai-safety-and-the-future.html posts/a-verifiable-autonomous-government.html posts/accelerando.html posts/musing-on-identity.html /usr/share/nginx/html/posts/
COPY posts/taxonomy-of-living-systems.html posts/capitalism-and-post-human-markets.html posts/it-from-bit.html /usr/share/nginx/html/posts/

COPY posts/inside-an-h100.html /usr/share/nginx/html/posts/
COPY assets/h100/atlas.css assets/h100/atlas.js /usr/share/nginx/html/assets/h100/
COPY assets/h100/vendor/three.core.js assets/h100/vendor/three.module.js assets/h100/vendor/OrbitControls.js assets/h100/vendor/THREE-LICENSE.txt /usr/share/nginx/html/assets/h100/vendor/

COPY assets/autonomous-government.webp /usr/share/nginx/html/assets/
