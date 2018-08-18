const streams = "https://wind-bow.glitch.me/twitch-api/streams/";
const channels = "https://wind-bow.glitch.me/twitch-api/channels/";

const arr = [
  "ESL_SC2",
  "OgamingSC2",
  "cretetion",
  "freecodecamp",
  "storbeck",
  "giantwaffle",
  "habathcx",
  "bobross",
  "RobotCaleb",
  "noobs2ninjas",
  "fuslie",
  "streamerhouse",
  "monstercat",
  "ninja",
  "goldglove",
  "moonmoon_ow"
];

const $navItem = $(".nav-item");
const $main = $(".main");
const $offline = $(".offline");
const $online = $(".online");
let currentStatus, truncatedInfo;

function loadingChannels() {
  for (const i of arr) {
    const apiStreamsLink = streams + i;
    const apiChannelsLink = channels + i;

    axios.get(apiStreamsLink).then(res => {
      if (res.data.stream === null || res.data.stream === undefined) {
        currentStatus = "Offline";
      } else {
        currentStatus = "Online";
      }
    });

    axios.get(apiChannelsLink).then(res => {
      const {
        url,
        status,
        logo,
        display_name,
        name,
        views,
        followers
      } = res.data;

      if (status.length > 50) {
        truncatedInfo = status.substring(0, 50) + "...";
      } else {
        truncatedInfo = status;
      }

      let result =
        `<div class='container'>
            <div class='channel'>
              <a href=${url} target='_blank'>
                <img class='avatar' src=${logo} alt='avatar of ${name}'/>
              </a>
              <div class='content'>
                <div class='user'>
                  <span class='user__name'>${display_name}</span>
                  <span class='user__handle'>
                    <a class='user__handle--link' href=${url} target='_blank'>
                      @${name}
                    </a>
                  </span>   
                </div>
        
                <div class='info'>
                  ${truncatedInfo}
                </div>
          
                <div class='stats'>
                  <span class='stats-item'>
                    <span class='stats-item__text'>View</span>
                    <span class='stats-item__number'>${views}</span>
                  </span>
                  <span class='stats-item'>
                    <span class='stats-item__text'>Follower</span>
                    <span class='stats-item__number'>${followers}</span>
                  </span>
                </div>
              </div>
            </div>` +
        `<div class='status'>
            <span class='status__text'>` +
        currentStatus +
        `</span>`;

      if (currentStatus === "Online") {
        result += `<span class='status__current status__current--online'></span></div></div>`;
        $online.append(result);
      } else {
        result += `<span class='status__current status__current--offline'></span></div></div>`;
        $offline.append(result);
      }
    });
  }
}

$(document).ready(() => {
  loadingChannels();

  $navItem.on("click", function() {
    $(".nav-item").removeClass("active");
    $(this).addClass("active");

    if ($(this).text() === "Online") {
      $main
        .children()
        .hide()
        .removeClass("hidden")
        .fadeIn();
      $offline.addClass("hidden");
    } else if ($(this).text() === "Offline") {
      $main
        .children()
        .hide()
        .removeClass("hidden")
        .fadeIn();
      $online.addClass("hidden");
    } else {
      $main
        .children()
        .hide()
        .removeClass("hidden")
        .fadeIn();
    }
  });
});
