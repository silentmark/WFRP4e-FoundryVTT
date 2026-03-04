if (args.sourceItem?.name.includes("Bite"))
{
    let woundsGained = args.totalWoundLoss;
    this.script.message(`Otrzymano Rany: ${woundsGained}`, { whisper: ChatMessage.getWhisperRecipients("GM") })
    this.actor.modifyWounds(woundsGained)
}