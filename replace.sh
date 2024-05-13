#REACT_APP_KEYCLOAK_URL=`echo "$REACT_APP_KEYCLOAK_URL" | awk -F/ '{print $3}'`

#find /usr/share/nginx/html/ -type f -exec sed -i "s/REACT_APP_KEYCLOAK_URL_VALUE/https:\/\/$REACT_APP_KEYCLOAK_URL/g" {} \;

# find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_URL_VALUE,$REACT_APP_KEYCLOAK_URL,g" {} \;
# find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_PATH_AUTHEN_VALUE,$REACT_APP_KEYCLOAK_PATH_AUTHEN,g" {} \;
# find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_PATH_ACCESS_TOKEN_VALUE,$REACT_APP_KEYCLOAK_PATH_ACCESS_TOKEN,g" {} \;
# find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_PATH_REFRESH_ACCESS_TOKEN_VALUE,$REACT_APP_KEYCLOAK_PATH_REFRESH_ACCESS_TOKEN,g" {} \;

find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_URL_VALUE,$REACT_APP_KEYCLOAK_URL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_AUTHENTICATION_URL_VALUE,$REACT_APP_KEYCLOAK_AUTHENTICATION_URL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_REFRESH_TOKEN_URL_VALUE,$REACT_APP_KEYCLOAK_REFRESH_TOKEN_URL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_LOGOUT_URL_VALUE,$REACT_APP_KEYCLOAK_LOGOUT_URL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_GRANT_TYPE_VALUE,$REACT_APP_KEYCLOAK_GRANT_TYPE,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_CLIENT_ID_VALUE,$REACT_APP_KEYCLOAK_CLIENT_ID,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_CLIENT_SECRET_VALUE,$REACT_APP_KEYCLOAK_CLIENT_SECRET,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_KEYCLOAK_TIME_OUT_VALUE,$REACT_APP_KEYCLOAK_TIME_OUT,g" {} \;

find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_POS_BACK_BE_URL_VALUE,$REACT_APP_POS_BACK_BE_URL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_POS_BACK_BE_TIME_OUT_VALUE,$REACT_APP_POS_BACK_BE_TIME_OUT,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_POS_BACK_VERSION_VALUE,$REACT_APP_POS_BACK_VERSION,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_OWN_BRANCH_CODE_VALUE,$REACT_APP_OWN_BRANCH_CODE,g" {} \;

find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_BRANCH_GROUP_DC_VALUE,$REACT_APP_BRANCH_GROUP_DC,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_BRANCH_LOCATION_DC_VALUE,$REACT_APP_BRANCH_LOCATION_DC,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_BRANCH_GROUP_OC_VALUE,$REACT_APP_BRANCH_GROUP_OC,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_DC_PERCENT_VALUE,$REACT_APP_DC_PERCENT,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_POS_BACK_PRINTER_VALUE,$REACT_APP_POS_BACK_PRINTER,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_CHANNEL_VALUE,$REACT_APP_CHANNEL,g" {} \;
find /usr/share/nginx/html/ -type f -exec sed -i "s,REACT_APP_CURRENCY_VALUE,$REACT_APP_CURRENCY,g" {} \;







