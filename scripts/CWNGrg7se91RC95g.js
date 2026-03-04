if (args.totalWoundLoss > 0) {
  if (args.opposedTest)
  {
    args.opposedTest.result.other.push(
      `@Corruption[minor]{Wystawienie na Umiarkowane Zepsucie}`
    )
  }
  this.script.message(`<strong>${this.effect.name}</strong>: 
      @Corruption[moderate]{Wystawienie na Umiarkowane Zepsucie} <br/>
      <strong>${args.actor.prototypeToken.name}</strong> musi wykonać test na 
      <strong>Zepsucie (Umiarkowane)</strong>`, 
      {whisper: ChatMessage.getWhisperRecipients("GM")}
  )
}