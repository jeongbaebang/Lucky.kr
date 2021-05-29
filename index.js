//상단유저정보 노드
class UserInfoNode {
  constructor() {
    this.$economicAim = document.getElementById("js-economic-aim");
    this.$capital = document.getElementById("js-capital");
  }
}
//상당진행정보 노드
class ProcessInfoNode {
  constructor() {
    this.$multiplication = document.getElementById("js-multiplication");
    this.$count = document.getElementById("js-count");
    this.$time = document.getElementById("js-time");
  }
}
//메인버튼 노드
class MainButtonNode {
  constructor() {
    this.$mainBtnG = document.getElementById("js-mainBtnG");
    this.$mainleftBtn = document.getElementById("js-mainLeftBtn");
    this.$mainRightBtn = document.getElementById("js-mainRightBtn");
  }
}
//하단배팅 노드
class BetNode {
  constructor() {
    this.$betInput = document.getElementById("js-betInput");
    this.$winInput = document.getElementById("js-winInput");
    this.$loseInput = document.getElementById("js-loseInput");
  }
}
//하단진행버튼 노드
class ProcessButtonNode {
  constructor() {
    this.$sectionBtnG = document.getElementById("js-sectionBtnG");
    this.$readyBtn = document.getElementById("js-readyBtn");
    this.$nextBtn = document.getElementById("js-nextBtn");
  }
}

/*노드 정보 클래스*/
class Node {
  constructor() {
    this.userInfoNode = new UserInfoNode();
    this.processInfoNode = new ProcessInfoNode();
    this.mainButtonNode = new MainButtonNode();
    this.betNode = new BetNode();
    this.processButtonNode = new ProcessButtonNode();
  }
}

class UserInfoEvent extends Node {
  constructor(user) {
    super();
    const { $economicAim, $capital } = this.userInfoNode;

    const {
      userEconomicAim,
      userInfo: { userCapital },
    } = user.getState();

    $economicAim.value = user.numberWithCommas(userEconomicAim);
    $capital.value = user.numberWithCommas(userCapital);
  }
}
class ProcessInfoEvent extends Node {
  constructor(user) {
    super();
    const { $multiplication, $count, $time } = this.processInfoNode;
    const { multiplication, count, time } = user.getState();

    $multiplication.textContent = `X${multiplication}`;
    $count.textContent = `#${count}`;
    $time.textContent = `00:0${time}`;
  }
}

class MainButtonEvent extends Node {
  constructor(user) {
    super();
    const { $mainleftBtn, $mainRightBtn } = this.mainButtonNode;
    $mainleftBtn.addEventListener("click", () => {
      user.clickLeft();

      const {
        userInfo: { leftBtnClick },
      } = user.getState();

      leftBtnClick
        ? ($mainleftBtn.classList.add("css-button-active"),
          $mainRightBtn.classList.add("disabled"))
        : ($mainleftBtn.classList.remove("css-button-active"),
          $mainRightBtn.classList.remove("disabled"));
    });

    $mainRightBtn.addEventListener("click", () => {
      user.clickRight();

      const {
        userInfo: { rightBtnClick },
      } = user.getState();

      rightBtnClick
        ? ($mainRightBtn.classList.add("css-button-active"),
          $mainleftBtn.classList.add("disabled"))
        : ($mainRightBtn.classList.remove("css-button-active"),
          $mainleftBtn.classList.remove("disabled"));
    });
  }
}
class BetEvent extends Node {
  constructor(user) {
    super();
    const { $betInput, $winInput, $loseInput } = this.betNode;
    let step = 500000;
    const { multiplication } = user.getState();

    $betInput.addEventListener("focus", () => {
      const {
        userInfo: { userCapital },
      } = user.getState();

      $betInput.max = userCapital < 0 ? 0 : userCapital;
    });

    $betInput.addEventListener("change", () => {
      user.setBettingAmount($betInput.value);
      const {
        multiplication,
        userInfo: { userCapital, bettingAmount },
      } = user.getState();

      const result = user.numberWithCommas(multiplication * bettingAmount);
      $winInput.value = `WIN +${result}`;
      $loseInput.value = `LOSE -${result}`;
    });
  }
}

class ProcessButtonEvent extends Node {
  constructor(user) {
    super();

    const { $readyBtn, $nextBtn } = this.processButtonNode;

    this.node = Node;
    $readyBtn.addEventListener("click", () => {
      const {
        userInfo: {
          leftBtnClick: left,
          rightBtnClick: right,
          readyBtnClick: ready,
        },
      } = user.getState();

      (left || right) && !ready
        ? (user.clickReadyBtn(),
          $readyBtn.classList.add("css-ready-active"),
          ($readyBtn.innerText = "READY!!"))
        : (user.cancelReadyBtn(),
          $readyBtn.classList.remove("css-ready-active"),
          ($readyBtn.innerText = "READY?"));
    });

    $nextBtn.addEventListener("click", () => {
      const {
        userInfo: {
          leftBtnClick: left,
          rightBtnClick: right,
          readyBtnClick: ready,

          bettingAmount: bet,
          nextBtnClick: next,
        },
      } = user.getState();

      if ((left || right) && ready && !next && bet !== 0) {
        console.log("[ok]");
        user.clickNextBtn();
        user.proceed([
          this.userInfoNode,
          this.processInfoNode,
          this.mainButtonNode,
          this.betNode,
          this.processButtonNode,
        ]);
      }

      if (next) {
        user.clickNextGame([
          this.mainButtonNode,
          this.betNode,
          this.processButtonNode,
          this.processInfoNode,
        ]);
      }
    });
  }
}

class Event {
  constructor() {
    this.user = new Observer(new UserSubject());

    [
      UserInfoEvent,
      ProcessInfoEvent,
      MainButtonEvent,
      BetEvent,
      ProcessButtonEvent,
    ].forEach((c) => {
      new c(this.user);
    });
  }
}

class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers = [...this.observers, observer];
  }

  unsubscrive(observer) {
    this.observers = this.observers.filter((obs) => observer !== obs);
  }

  notify(state) {
    this.observers.forEach((observer) => observer(state));
  }
}

class UserSubject extends Observable {
  constructor() {
    super();
    this.state = {
      userEconomicAim: 500000000,
      multiplication: 2,
      count: 0,
      time: 0,
      result: null,
      win: false,
      victory: false,
      userInfo: {
        userCapital: 5000000,
        leftBtnClick: false,
        rightBtnClick: false,
        bettingAmount: 0,
        readyBtnClick: false,
        nextBtnClick: false,
      },
    };
  }

  setState(nextState) {
    this.state = nextState;
    this.notify(this.state);
  }

  getState() {
    return this.state;
  }
}

class Action {
  constructor() {
    this.engine = new Engine();
  }
  clickLeft() {
    const {
      userInfo,
      userInfo: { leftBtnClick },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, leftBtnClick: !leftBtnClick },
    });
  }

  clickRight() {
    const {
      userInfo,
      userInfo: { rightBtnClick },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, rightBtnClick: !rightBtnClick },
    });
  }

  setBettingAmount(amount) {
    const {
      userInfo,
      userInfo: { bettingAmount },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, bettingAmount: +amount },
    });
  }

  clickReadyBtn() {
    const {
      userInfo,
      userInfo: { readyBtnClick },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, readyBtnClick: true },
    });
  }
  cancelReadyBtn() {
    const {
      userInfo,
      userInfo: { readyBtnClick },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, readyBtnClick: false },
    });
  }

  clickNextBtn() {
    const {
      userInfo,
      userInfo: { nextBtnClick },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      userInfo: { ...userInfo, nextBtnClick: !nextBtnClick },
    });
  }

  numberWithCommas(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  }

  clickNextGame($nodeArr) {
    const [$mainBtn, $bet, $processBtn, $processInfo] = $nodeArr;
    const { $count, $multiplication } = $processInfo;
    const { $mainleftBtn, $mainRightBtn } = $mainBtn;
    const { $betInput, $winInput, $loseInput } = $bet;
    const { $readyBtn, $nextBtn } = $processBtn;
    [$mainRightBtn, $mainleftBtn].forEach(($node) => {
      $node.classList.remove("css-button-active");
      $node.classList.remove("disabled");
    });
    [$winInput, $loseInput].forEach(($node) => {
      $node.classList.remove("select-active");
    });
    $readyBtn.classList.remove("css-ready-active");
    $readyBtn.textContent = "READY?";

    $nextBtn.classList.remove("next-game");
    $nextBtn.textContent = "START->";

    const { count, multiplication } = this.getState();

    $count.textContent = `#${count}`;
    $multiplication.textContent = `X${multiplication}`;
    $betInput.value = null;
    $winInput.value = `WIN +${0}원`;
    $loseInput.value = `LOSE -${0}원`;
    this.reset();
  }

  reset() {
    const {
      result,
      victory,
      userInfo,
      userInfo: {
        bettingAmount,
        leftBtnClick,
        rightBtnClick,
        readyBtnClick,
        nextBtnClick,
      },
    } = this.getState();
    this.setState({
      ...this.subject.state,
      result: null,
      victory: false,
      userInfo: {
        ...userInfo,
        bettingAmount: 0,
        leftBtnClick: false,
        rightBtnClick: false,
        readyBtnClick: false,
        nextBtnClick: false,
      },
    });
  }
  proceed($nodeArr) {
    const [$userInfo, $processInfo, $mainBtn, $bet, $processBtn] = $nodeArr;
    const { $capital } = $userInfo;
    const { $time, $count, $multiplication } = $processInfo;
    const { $mainleftBtn, $mainRightBtn } = $mainBtn;
    const { $betInput, $winInput, $loseInput } = $bet;

    const { $nextBtn, $readyBtn } = $processBtn;
    const promise = this.engine.startTimer($time);

    promise
      //결과값저장.
      .then(() => {
        const comResult = this.engine.getResult();

        const { result } = this.getState();

        this.setState({
          ...this.subject.state,
          result: comResult,
        });
      })
      //승리여부저장.
      .then(() => {
        const {
          result,
          victory,
          userInfo: { leftBtnClick: left, rightBtnClick: right },
        } = this.getState();
        console.log(result);
        if ((result === "left" && left) || (result === "right" && right)) {
          this.setState({
            ...this.subject.state,
            victory: true,
          });
        }
      })
      //선택금액활성화.
      .then(() => {
        const {
          multiplication: mul,
          victory: vic,
          userInfo,
          userInfo: { bettingAmount: bet, userCapital },
        } = this.getState();

        vic
          ? $winInput.classList.add("select-active")
          : $loseInput.classList.add("select-active");

        const betResult = vic ? mul * bet : -(mul * bet);

        this.setState({
          ...this.subject.state,
          userInfo: { ...userInfo, userCapital: userCapital + betResult },
        });
      })
      //다음게임활성화.
      .then(() => {
        const {
          count,
          multiplication,
          result,
          userEconomicAim,
          userInfo,
          win,
          userInfo: { nextBtnClick, userCapital: userCap },
        } = this.getState();

        $capital.value = this.numberWithCommas(userCap);

        if (userCap < 0) $nextBtn.textContent = "FAILED :(";
        else {
          $nextBtn.textContent = "NEXT_GAME";
          $nextBtn.classList.add("next-game");
        }

        const nextCount = count + 1;
        const getMultiplication = this.engine.getMultiplication();

        if (userEconomicAim < userCap && win === false) {
          window.alert(
            "축하합니다!\n도전금액에 도달하셨군요.\n스크린샷으로 자랑하세요:)"
          );
          this.setState({
            ...this.subject.state,
            win: true,
          });
        }

        this.setState({
          ...this.subject.state,
          count: nextCount,
          multiplication: getMultiplication,
        });
      });
  }
}
class Observer extends Action {
  constructor(subject) {
    super();
    this.subject = subject;
    this.subject.subscribe(this.update.bind(this));
  }

  getState() {
    return this.subject.getState();
  }

  setState(nextState) {
    this.subject.setState(nextState);
  }

  update(state) {
    console.log("[UPDATE]");
    console.dir(state);
  }
}

class Result {
  getResult() {
    return Math.random() < 0.5 ? "left" : "right"; //50%
  }
  getRandomMultiplication(min = 2, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값도 포함, 최솟값도 포함
  }
}

class Proceed {
  constructor() {}

  startTimer($node) {
    let START = 3;
    const END = 0;
    return new Promise((resolve, reject) => {
      const ID = setInterval(() => {
        START < END
          ? (clearTimeout(ID), $node.classList.remove("active"), resolve())
          : ($node.classList.add("active"),
            ($node.innerText = `00:0${START--}`));
      }, 1000);
    });
  }
}

class Engine {
  constructor() {
    this.result = new Result();
    this.proceed = new Proceed();
  }

  startTimer($node) {
    return this.proceed.startTimer($node);
  }

  getResult() {
    return this.result.getResult();
  }

  getMultiplication() {
    return this.result.getRandomMultiplication();
  }
}

class Game {
  constructor() {
    new Event();
  }
}

new Game();
