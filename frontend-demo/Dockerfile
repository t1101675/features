FROM jkxing/sedemo:0.1.0
COPY . /app
WORKDIR /app
RUN cnpm install
RUN npm run build
RUN cp -R /app/dist/* /var/www/html/
EXPOSE 80
ENV TEST_ROOT /app
ENV PORT 80
CMD ["nginx","-g","daemon off;"]