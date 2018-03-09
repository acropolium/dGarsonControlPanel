##Requirements
Before deploying this project you must to install next:
  * Apache - version 2.0 or higher
  * NPM
  * Firebase account

### Install NPM
Here is the description of installing Node and NPM via NVM. If you prefer another way to install Node and NVM or you 
already install its, you can miss this step.
To start off, we will need to get the software packages, that will allow us to build source packages. The NVM script
will use these tools to build the necessary components:
```bash
 $ sudo apt-get update
 $ sudo apt-get install build-essential libssl-dev  
 ``` 
 After the required packages will be install, you can download NVM installation script from
 [project's GitHub page](https://github.com/creationix/nvm). The version number can be different, the latest version 
 you can see [here](https://github.com/creationix/nvm/releases).
 ```bash
  $ curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh -o install_nvm.sh
 ```
 Run the script with ```bash```:
 ```bash
  $ bash install_nvm.sh
 ```
 To get access to the NVM functionality, you'll need to reopen your terminal or run command:
 ```bash
  $ source ~/.profile
 ```
 To find out which versions of Node are available, you can type:
 ```bash
  nvm ls-remote
 ```
 The newest LTS version at the time of this writing is v8.9.4. Install and use it by typing:
 ```bash
  $ nvm install 8.9.4
  $ nvm use 8.9.4
 ```  

### Install Apache 
Open your terminal and run command ```sudo apt-get install apache2```.
Open folder ```/etc/apache2/sites-available```, create file ```[YOUR_PROJECT_NAME].conf``` and open it in any text editor.
Put such code there: 
```apache
  <VirtualHost *:80>
          ServerName [YOUR SERVER HOST NAME]
          DirectoryIndex index.php index.html index.htm
          DocumentRoot  [PATH_TO_PROJECT_FOLDER]/www
          <Directory  [PATH_TO_PROJECT_FOLDER]/www>
                  Options FollowSymLinks MultiViews
                  AllowOverride All
                  Require all granted
          </Directory>
          ErrorLog /var/log/apache2/error.log 
          LogLevel notice
          CustomLog /var/log/apache2/access.log combined
  </VirtualHost>   
 ```
Then run in terminal:
```bash
  $ sudo a2ensite [YOUR_PROJECT_NAME].conf
  $ sudo service apache2 reload
```

 ##Deploying
   Clone repository with project, after go to the project directory and run ```npm install```. Set your message sender id in ```src/firebase-messaging-sw.js```.
   In ```index.html``` set your google api key for maps.
   Open ```/src/providers/config``` file and edit it:
   * ```DEV_URL``` - url for development version of your api.
   * ```PRODUCTION_URL``` - url for production version of your api.
   * ```APP_KEY``` - api key from firebase.
   * ```AUTH_DOMAIN``` - auth domain for firebase.
   * ```DATABASE_URL``` - your firebase database url.
   * ```STORAGE_PATH``` - path for your firebase storage.
   * ```SENDER_ID``` - sender id from firebase.
   
   Then run command ```npm run build```.
