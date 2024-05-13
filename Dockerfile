ARG BUILDER_IMAGE=node:lts-alpine
ARG BASE_IMAGE=nginx:stable-alpine
# build stage
FROM $BUILDER_IMAGE as build-stage
WORKDIR /app
COPY . .
RUN npm install \
&& npm run build
# production stage
FROM $BASE_IMAGE as production-stage
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY replace.sh /usr/share/nginx/html/
RUN chmod 755 /usr/share/nginx/html/replace.sh
RUN mkdir -p /etc/nginx/templates
#COPY default.conf.template /etc/nginx/templates/
#COPY scripts/docker-entrypoint.sh /
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
#CMD ["nginx", "-g", "daemon off;"]
#CMD ["/bin/sh", "-c", nginx -g \"daemon off;\""]
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/replace.sh && nginx -g \"daemon off;\""]