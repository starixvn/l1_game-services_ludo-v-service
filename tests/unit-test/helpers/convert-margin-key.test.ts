import { convertMarginKeys } from "../../../src/helpers/convert-margin-keys";

describe("convertMarginKeys", () => {
  it("should convert margin keys", () => {
    // Arrange
    const margins = {
      marginMove: 0.04,
      marginNoMove: 0.04,
      marginKick: 0.04,
      marginNoKick: 0.04,
      marginRelease: 0.04,
      marginNoRelease: 0.04,
      marginGoStable: 0.04,
      marginNoStable: 0.04,
      marginBig: 0.04,
      marginSmall: 0.04,
      marginOdd: 0.04,
      marginEven: 0.04,
    };

    // Act
    const convertedMargins = convertMarginKeys(margins);

    // Assert
    expect(convertedMargins).toEqual({
      big: 0.04,
      small: 0.04,
      odd: 0.04,
      even: 0.04,
      move: 0.04,
      noMove: 0.04,
      release: 0.04,
      noRelease: 0.04,
      goStable: 0.04,
      noStable: 0.04,
      kick: 0.04,
      noKick: 0.04,
    });
  });
});
