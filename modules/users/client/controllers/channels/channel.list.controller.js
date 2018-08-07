(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChannelListController', ChannelListController);

  ChannelListController.$inject = ['$scope', 'ChannelsService', 'ChannelEpgService', 'Authentication'];


  function ChannelListController($scope, ChannelsService, ChannelEpgService, Authentication) {

    var vm = this;
    vm.playerActive = true;
    vm.volumeOf = false;
    vm.channelUrl = '';
    vm.tempPlayingContent = '';
    vm.nextPlayingContent = '';
    vm.tempPlayingTime = '';
    vm.nextPlayingTime = '';
    vm.channelsList = [];
    vm.user = Authentication.user;
    vm.currentChannel = vm.channelsList[0];
    vm.changeCurrentChannel = changeCurrentChannel;
    vm.playChannel = playChannel;
    vm.stopPlayer = stopPlayer;
    vm.turnOnVolume = turnOnVolume;
    vm.turnOfVolume = turnOfVolume;
    vm.setFullScreen = setFullScreen;
    getChannels();

    function changeCurrentChannel(channel) {
      vm.currentChannel = channel;
      retrieveChannelEpg(channel.id);
      getChannelUrl(channel.id);
    }

    function getChannels() {
      ChannelsService.loadChannels().then(function (data) {
        vm.channelsList = data;
        changeCurrentChannel(vm.channelsList[0]);
        getChannelUrl(vm.currentChannel.id);
      });
    }

    function getChannelUrl(channelId) {
      ChannelsService.getChannelUrl(channelId).then(function (channelUrl) {
        vm.channelUrl = channelUrl;
        playChannel(vm.channelUrl);
      });

    }

    function retrieveChannelEpg(channelId) {
      ChannelEpgService.loadChannelEpg(channelId, 2).then(function (channelEpg) {
        updateCurrentEPG(channelEpg[1]);
        updateNextEPG(channelEpg[0]);
      });
    }

    function updateCurrentEPG(epg) {
      if (epg !== null && epg !== undefined) {
        vm.nextPlayingTime = convertToHumanReadableTime(epg.start) + ' - ' + convertToHumanReadableTime(epg.end);
        vm.nextPlayingContent = epg.name;
      }
    }

    function updateNextEPG(epg) {
      if (epg !== null && epg !== undefined) {
        vm.tempPlayingTime = convertToHumanReadableTime(epg.start) + ' - ' + convertToHumanReadableTime(epg.end);
        vm.tempPlayingContent = epg.name;
      }
    }

    function convertToHumanReadableTime(pointOfTime) {
      var date = new Date(pointOfTime * 1000);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      return (('0' + hours).slice(-2)) + ':' + (('0' + minutes).slice(-2));
    }

    function stopPlayer() {
      vm.playerActive = false;
      window.jwplayer('player').stop();
    }

    function turnOfVolume() {
      vm.volumeOf = true;
      window.jwplayer('player').setMute(true);
    }

    function turnOnVolume() {
      window.jwplayer('player').setMute(false);
      vm.volumeOf = false;
      window.jwplayer('player').setVolume(100);
    }

    function setFullScreen() {
      window.jwplayer('player').setFullscreen(true);
    }

    function playChannel(channelUrl) {
      if (window.jwplayer('player') !== undefined) {
        window.jwplayer('player').setup({
          file: channelUrl
        });
      }
    }
  }
}());
