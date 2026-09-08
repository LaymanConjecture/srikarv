FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html 404.html style.css main.js /usr/share/nginx/html/
COPY assets/valley-day.webp assets/valley-night.webp assets/favicon.svg /usr/share/nginx/html/assets/
COPY assets/owl-flight.webp assets/owl-rest.webp /usr/share/nginx/html/assets/
