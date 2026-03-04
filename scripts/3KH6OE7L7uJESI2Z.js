if (["smok"].includes(args.opposedTest?.defender.details.species.value.toLowerCase()))
    {
      args.applyTB = false;
      args.opposedTest?.result.other.push("<b>Smokobójca</b>: Ignoruje BWt przeciw smokom");
    }