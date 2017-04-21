/*global logger*/
/*
    BrowserLanguageSetup 
    ========================

    @file      : BrowserLanguageSetup.js
    @version   : 1.0.0
    @author    : Dragos Vrabie
    @date      : Thu, 30 Jun 2016 08:44:46 GMT
    @copyright : AuraQ Ltd
    @license   : Apache 2/MIT

    Documentation
    ========================
    Describe your widget here.
*/
require([
    "dojo/_base/declare",
    "BrowserLanguageSetup/lib/jquery-1.11.2",
    "mxui/widget/_WidgetBase",
    "dojo/_base/lang"
], function (declare,_jQuery, _WidgetBase,lang) {
    "use strict";

    return declare("BrowserLanguageSetup.widget.BrowserLanguageSetup", [_WidgetBase], {

        postCreate: function () {
            logger.level(logger.DEBUG);
            logger.debug(this.id + ".postCreate");

            //TODO: Perhaps check if we're dealing with an anonymous user

            var browserLanguage = window.navigator.userLanguage || window.navigator.language;

            if(browserLanguage!=null && browserLanguage !='undefined')
            {
                var userID = mx.session.getUserId();
                var setLanguage = this._setUserLanguage;
                var microflow = this.langChangeMF;

                mx.data.get({
                    guid: userID,
                    callback: function(userObj){
                        var refs = userObj.getReferenceAttributes();
                        userObj.fetch("System.User/System.User_Language/System.Language",function(currentLangObj){

                            var currentLangCode =currentLangObj.get('Code');

                            logger.debug("Browser language detected as " +browserLanguage+ " for user " +userObj+" with current language "+currentLangCode);

                            if(currentLangCode != browserLanguage && currentLangCode.indexOf(browserLanguage)===-1)
                            {
                                logger.debug('Evaluated languages as different, retrieving browser language');

                                var langXPath= '//System.Language[Code="'+browserLanguage+'"]';

                                mx.data.get({
                                    xpath: langXPath,
                                    callback: function(langObj){
                                        if(langObj!='')
                                        {
                                            logger.debug('Found the browser language in the application');
                                            setLanguage(langObj,microflow);
                                        }
                                        else
                                        {
                                            logger.debug('No language in the application corresponds to the given code, searching for languages containing browser code');

                                            langXPath='//System.Language[contains(Code,"'+browserLanguage+'")]';
                                            mx.data.get({
                                                xpath: langXPath,
                                                callback: function(langObjContains){
                                                    if(langObjContains!='')
                                                    {
                                                        logger.debug('Found the browser language in the application');
                                                        setLanguage(langObjContains,microflow);
                                                    }
                                                    else
                                                    {
                                                        logger.debug('No language found');
                                                    }
                                                }
                                            });
                                        }                               
                                    }
                                });
                            }                            
                        });
                    }
                });
            }

        },       

        _setUserLanguage:function(language,microflow){
            
            var _params = {
                applyto: "selection",
                actionname: "",
                guids:[language.toString()]
            }
            
            _params.actionname=microflow;
            
            mx.data.action({
                params:_params,
                callback:function(obj){
                    if(obj)
                    {
                        logger.debug('Set user language');
                    }
                    else
                    {
                        logger.debug('Failed to set user language as '+language);
                    }
                }
            });
            //            if(user.removeReferences('System.User_Language',currentLanguage))
            //            {
            //                if(user.addReference('System.User_Language',language))
            //                {
            //                    logger.debug('Set user language');
            //                }
            //                else
            //                {
            //                    logger.debug('Failed to set user language as '+language);
            //                }
            //            }
            //            else
            //            {
            //                logger.debug('Failed to remove current user language');
            //            }            
        },

        update: function (obj, callback) {
            logger.debug(this.id + '.update');
            callback();
        }
    });
});